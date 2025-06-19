import User from "../models/User.js"
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user._id
        const currentUser = req.user

        const recommendedUsers = await User.find({
            _id: { $ne: currentUserId, $nin: currentUser.friends }, //  exclude self & current users's friends
             isOnboarded: true,
            });

        res.status(200).json(recommendedUsers)
    } catch (error) {
        console.error("Error in getRecommendedUsers controller", error.message)
        res.status(500).json({message: "Internal Server Error"})
        
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id)
        .select("friends")
        .populate("friends", "fullName profilePic nativeLanguage learningLanguage")
        
        res.status(200).json(user.friends)

    } catch (error) {
        console.error("Error in getMyFriends controller", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
    
}

export async function sendFriendRequest(req, res){
     try {
        const myId = req.user.id;
        const { id: recipientId } = req.params

        if(myId === recipientId){
            return res.status(400).json({message: "you can't send friend request to yourself"})
        }

        const recipient = await User.findById(recipientId)
        if(!recipient){
            return res.status(404).json({message: "Recipient not found"})
        }

        if(recipient.friends.includes(myId)){
            return res.status(400).json({message: "You are already friends with the user"})
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                {sender: myId, recipient: recipientId},
                {sender: recipientId, recipient: myId},
            ],
        })
        if(existingRequest){
            return res.status(400).json({message: "A friend request already exists between you and this user"})
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        })
        res.status(201).json(friendRequest)

     } catch (error) {
        console.error("Error in sendFriendRequest controller", error.message)
        res.status(500).json({message: "Internal Server Error"})
     }
}

export async function accceptFriendRequest(req, res) {
    try {
        const {id: requestId} = req.params;

        const friendRequest = await FriendRequest.findById(requestId)

        if (!friendRequest){
            return res.status(404).json({message: "Friend request not found"})
        }

        if(friendRequest.recipient.toString() !== req.user.id){
            return res.status(403).json({message: "you are not authorize to accpet this request"})
        }
        friendRequest.status = "accepted"
        await friendRequest.save()

        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: {friends: friendRequest.recipient}
        })

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: {friends: friendRequest.sender}
        })

        res.status(200).json({message: "Friend request accepted"})

    } catch (error) {
        console.log("Error in acceptFriendRequest controller", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export async function getFriendRequest(req,res) {
    try {
        const incomingReqs =  await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage")

        const acceptReqs = await FriendRequest.find({
            sender: req.user.id,
            status: "accepted",
        }).populate("recipient", "fullName profilePic")

        res.status(200).json({incomingReqs, acceptReqs })
    } catch (error) {
        console.log("Error in getPendingFriendRequest controller", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export async function getOutgoingFriendReqs(req, res) {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "pending",

        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage")

        res.status(200).json(outgoingRequests)
    } catch (error) {
        console.log("Error in getOutgoingFriendReqs controller", error.message)
        res.status(500).json ({message: "Internal Server Error"})
    }
}