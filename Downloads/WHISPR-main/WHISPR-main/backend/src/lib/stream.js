import {StreamChat} from "stream-chat"
import "dotenv/config"

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Steam API key or Secret is missing")
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret)

export const upsertStreamUser = async (userData) => {
    try {
        if (!userData.id) {
            throw new Error("Stream User ID is missing")
        }

        await streamClient.upsertUser(userData)
        return userData
    } catch (error) {
        console.error("Error upserting Stream User:", error.message)
    }
}


export const generateStreamToken = (userId) => {
   try {
    const userIdStr = userId.toString()
    return streamClient.createToken(userIdStr)

   } catch (error) {
    console.log("Error generating stream token:", error )
   }
}


//  if (!userId) {
//         throw new Error("User ID is required to generate token")
//     }
//     return streamClient.createToken(userId)
