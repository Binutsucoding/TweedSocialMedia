import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";
import SuggestedUserMobileView from "../components/SuggestedUserMobileView";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const [suggestedUserInsertIndex, setSuggestedUserInsertIndex] = useState(-1);
  const showToast = useShowToast();

  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      setPosts([]);
      try {
        const res = await fetch("/api/posts/feed");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        console.log(data);
        setPosts(data);

        // Randomly determine where to insert suggested users after posts are loaded
        if (data.length > 0) {
          const minIndex = Math.min(1, data.length - 1);
          const maxIndex = Math.min(3, data.length - 1);
          const randomIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
          setSuggestedUserInsertIndex(randomIndex);
        }
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    getFeedPosts();
  }, [showToast, setPosts]);

  return (
    <Flex gap="10" alignItems={"flex-start"}>
      <Box flex={70} width="100%" overflow="hidden" >
        {!loading && posts?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <h1>Follow some users to see the feed</h1>
            <SuggestedUserMobileView />
          </div>
        )}

        {loading && (
          <Flex justify="center">
            <Spinner size="xl" />
          </Flex>
        )}

        {posts?.map((post, index) => (
          <Box key={post._id} width="100%" overflow="hidden">
            <Post post={post} postedBy={post.postedBy} />
            {index === suggestedUserInsertIndex && <SuggestedUserMobileView />}
          </Box>
        ))}
      </Box>
      <Box
        flex={30}
        display={{
          base: "none",
          md: "block",
        }}
        width="100%"
        overflow="hidden"
      >
        <SuggestedUsers />
      </Box>
    </Flex>
  );
};

export default HomePage;
