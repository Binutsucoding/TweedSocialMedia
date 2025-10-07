import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
  FormErrorMessage,
} from "@chakra-ui/react";

import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";

export default function SignupCard() {
  const [showPassword, setShowPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const showToast = useShowToast();
  const setUser = useSetRecoilState(userAtom);

  const [inputs, setInputs] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const checkPasswordRules = (password) => {
    return {
      hasUpperCase: /[A-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      isMinLength: password.length >= 6,
    };
  };

  const validateInputs = () => {
    const newErrors = {
      name: "",
      username: "",
      email: "",
      password: "",
    };

    if (!inputs.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (!/^[a-zA-Z\s]*$/.test(inputs.name)) {
      newErrors.name = "Name can only contain letters and spaces.";
    }

    if (!inputs.username.trim()) {
      newErrors.username = "Username is required.";
    }

    if (!inputs.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
      newErrors.email = "Please enter a valid email.";
    }

    const { hasUpperCase, hasSpecialChar, isMinLength } = checkPasswordRules(inputs.password);

    if (!inputs.password) {
      newErrors.password = "Password is required.";
    } else if (!isMinLength) {
      newErrors.password = "Password must be at least 6 characters long.";
    } else if (!hasUpperCase || !hasSpecialChar) {
      newErrors.password = "Password must include 1 uppercase and 1 special character.";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSignup = async () => {
    const isValid = validateInputs();
    if (!isValid) {
      showToast("Error", "Please fix the form errors before submitting.", "error");
      return;
    }

    try {
      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      localStorage.setItem("user-threads", JSON.stringify(data));
      setUser(data);
    } catch (error) {
      showToast("Error", error.message || "Something went wrong", "error");
    }
  };

  return (
    <Flex align={"center"} justify={"center"}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={23} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Sign up
          </Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.dark")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4}>
            <HStack>
              <Box>
                <FormControl isRequired isInvalid={!!errors.name}>
                  <FormLabel>Full name</FormLabel>
                  <Input
                    type="text"
                    value={inputs.name}
                    onChange={(e) =>
                      setInputs({ ...inputs, name: e.target.value })
                    }
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>
              </Box>
              <Box>
                <FormControl isRequired isInvalid={!!errors.username}>
                  <FormLabel>Username</FormLabel>
                  <Input
                    type="text"
                    value={inputs.username}
                    onChange={(e) =>
                      setInputs({ ...inputs, username: e.target.value })
                    }
                  />
                  <FormErrorMessage>{errors.username}</FormErrorMessage>
                </FormControl>
              </Box>
            </HStack>

            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={inputs.email}
                onChange={(e) =>
                  setInputs({ ...inputs, email: e.target.value })
                }
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={inputs.password}
                  onChange={(e) =>
                    setInputs({ ...inputs, password: e.target.value })
                  }
                />
                <InputRightElement h={"full"}>
                  <Button
                    variant={"ghost"}
                    onClick={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{inputs.password && (() => {
                const { hasUpperCase, hasSpecialChar, isMinLength } = checkPasswordRules(inputs.password);
                const unmet = [];

                if (!hasUpperCase) unmet.push("1 uppercase letter");
                if (!hasSpecialChar) unmet.push("1 special character");
                if (!isMinLength) unmet.push("at least 6 characters");

                if (unmet.length === 0) return null; // All conditions met, show nothing

                return (
                  <Text fontSize="sm" mt={2} color="red.500">
                    Password must contain {unmet.length === 1 ? unmet[0] : unmet.slice(0, -1).join(", ") + ", and " + unmet.slice(-1)}.
                  </Text>
                );
              })()}</FormErrorMessage>
            </FormControl>

            <Stack spacing={10} pt={2}>
              <Button
                size="lg"
                bg={useColorModeValue("gray.600", "gray.700")}
                color={"white"}
                _hover={{
                  bg: useColorModeValue("gray.700", "gray.800"),
                }}
                onClick={handleSignup}
              >
                Sign up
              </Button>
            </Stack>

            <Stack pt={6}>
              <Text align={"center"}>
                Already a user?{" "}
                <Link color={"blue.400"} onClick={() => setAuthScreen("login")}>
                  Login
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
