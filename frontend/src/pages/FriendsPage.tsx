import { useQuery } from "@tanstack/react-query";
import FriendCard from "../components/FriendCard";
import { getUserFriends } from "../lib/api";

const FriendsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  return (
    <main className="container mx-auto justify-center my-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {!isLoading &&
          data.map((friend) => <FriendCard key={friend._id} friend={friend} />)}
      </div>
    </main>
  );
};

export default FriendsPage;
