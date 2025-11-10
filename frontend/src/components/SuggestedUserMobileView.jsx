import { Avatar, Box, Button, Flex, Text, IconButton, useColorMode } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import useFollowUnfollow from "../hooks/useFollowUnfollow";
import useShowToast from "../hooks/useShowToast";

const SuggestedUserMobileView = () => {
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const showToast = useShowToast();


    useEffect(() => {
        const getSuggestedUsers = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/users/suggested");
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setSuggestedUsers(data.slice(0, 5)); // Limit to 5 for mobile view
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoading(false);
            }
        };

        getSuggestedUsers();
    }, [showToast]);

    const handleDismiss = (userId) => {
        setSuggestedUsers(suggestedUsers.filter((user) => user._id !== userId));
    };

    if (loading || suggestedUsers.length === 0) {
        return null;
    }

    return (
        <Box
            mb={4}
            display={{ base: "block", md: "none" }}
            width="100%"
            overflow="hidden"
        >
            <Flex justifyContent="space-between" alignItems="center" mb={3} px={2}>
                <Text fontSize="md" fontWeight="bold">
                    Suggested for you
                </Text>
                {/* <Button
                    variant="ghost"
                    size="sm"
                    colorScheme="blue"
                    fontSize="sm"
                    fontWeight="normal"
                >
                    See All
                </Button> */}
            </Flex>
            <Flex
                gap={3}
                overflowX="auto"
                overflowY="hidden"
                pb={2}
                px={2}
                width="100%"
                css={{
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                {suggestedUsers.map((user) => (
                    <SuggestedUserCard
                        key={user._id}
                        user={user}
                        onDismiss={() => handleDismiss(user._id)}
                    />
                ))}
            </Flex>
        </Box>
    );
};

const SuggestedUserCard = ({ user, onDismiss }) => {
    const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);
    const { colorMode } = useColorMode();

    return (
        <Box
            minW="140px"
            w="140px"
            flexShrink={0}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={3}
            position="relative"
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
        >
            <IconButton
                icon={<CloseIcon color={colorMode === "dark" ? "white" : "gray.800"} />}
                size="xs"
                position="absolute"
                top={1}
                right={1}
                onClick={onDismiss}
                bg="transparent"
            // borderRadius="sm"
            // _hover={{ bg: "red.600" }}
            // aria-label="Dismiss suggestion"
            />
            <Avatar
                src={user.profilePic}
                size="lg"
                as={Link}
                to={`/${user.username}`}
                onClick={(e) => e.stopPropagation()}
            />
            <Box textAlign="center" w="full">
                <Flex alignItems="center" justifyContent="center" gap={1}>
                    <Text fontSize="xs" fontWeight="semibold" noOfLines={1} color={colorMode === "dark" ? "white" : "black"}>
                        {user.username}
                    </Text>
                    {user.isVerified && (
                        <Box as="img" src="/verified.png" w={3} h={3} />
                    )}
                </Flex>
                {user.name && (
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                        {user.name}
                    </Text>
                )}
            </Box>
            <Button
                size={"sm"}
                color={following ? "black" : "white"}
                bg={following ? "white" : "blue.400"}
                onClick={handleFollowUnfollow}
                isLoading={updating}
                _hover={{
                    color: following ? "black" : "white",
                    opacity: ".8",
                }}
            >
                {following ? "Unfollow" : "Follow"}
            </Button>
        </Box>
    );
};

export default SuggestedUserMobileView;
