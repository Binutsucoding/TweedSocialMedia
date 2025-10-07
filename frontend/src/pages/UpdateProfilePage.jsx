import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	FormErrorMessage,
	Heading,
	Input,
	Stack,
	useColorModeValue,
	Avatar,
	Center,
	Text,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import usePreviewImg from "../hooks/usePreviewImg";
import useShowToast from "../hooks/useShowToast";

export default function UpdateProfilePage() {
	const [user, setUser] = useRecoilState(userAtom);
	const [inputs, setInputs] = useState({
		name: user.name,
		username: user.username,
		email: user.email,
		bio: user.bio,
		password: "",
	});
	const [errors, setErrors] = useState({});
	const fileRef = useRef(null);
	const [updating, setUpdating] = useState(false);

	const showToast = useShowToast();

	const { handleImageChange, imgUrl } = usePreviewImg();

	// Password validation function
	const checkPasswordRules = (password) => ({
		hasUpperCase: /[A-Z]/.test(password),
		hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
		isMinLength: password.length >= 6,
	});

	// Validate all fields, set errors and return if valid or not
	const validate = () => {
		const newErrors = {};

		// Name: required, letters + spaces only
		if (!inputs.name.trim()) {
			newErrors.name = "Full name is required.";
		} else if (!/^[a-zA-Z\s]+$/.test(inputs.name.trim())) {
			newErrors.name = "Name can only contain letters and spaces.";
		}

		// Username: required
		if (!inputs.username.trim()) {
			newErrors.username = "Username is required.";
		}

		// Email: required + format
		if (!inputs.email.trim()) {
			newErrors.email = "Email is required.";
		} else if (
			!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(inputs.email.trim())
		) {
			newErrors.email = "Please enter a valid email.";
		}

		// Password: optional to change, but if entered, validate rules
		if (inputs.password) {
			const { hasUpperCase, hasSpecialChar, isMinLength } = checkPasswordRules(
				inputs.password
			);
			if (!hasUpperCase || !hasSpecialChar || !isMinLength) {
				newErrors.password = "Password does not meet all requirements.";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (updating) return;

		if (!validate()) {
			showToast(
				"Validation Error",
				"Please fix the errors in the form before submitting.",
				"error"
			);
			return;
		}

		setUpdating(true);
		try {
			const res = await fetch(`/api/users/update/${user._id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...inputs, profilePic: imgUrl }),
			});
			const data = await res.json(); // updated user object
			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}
			showToast("Success", "Profile updated successfully", "success");
			setUser(data);
			localStorage.setItem("user-threads", JSON.stringify(data));
		} catch (error) {
			showToast("Error", error.message || error, "error");
		} finally {
			setUpdating(false);
		}
	};

	// Password dynamic message component
	const PasswordRequirement = () => {
		if (!inputs.password) return null;

		const { hasUpperCase, hasSpecialChar, isMinLength } = checkPasswordRules(
			inputs.password
		);
		const unmet = [];
		if (!hasUpperCase) unmet.push("1 uppercase letter");
		if (!hasSpecialChar) unmet.push("1 special character");
		if (!isMinLength) unmet.push("at least 6 characters");

		if (unmet.length === 0) return null;

		return (
			<Text fontSize="sm" mt={1} color="red.500">
				Password must contain{" "}
				{unmet.length === 1
					? unmet[0]
					: unmet.slice(0, -1).join(", ") + ", and " + unmet.slice(-1)}.
			</Text>
		);
	};

	return (
		<form onSubmit={handleSubmit}>
			<Flex align={"center"} justify={"center"} my={6}>
				<Stack
					spacing={4}
					w={"full"}
					maxW={"md"}
					bg={useColorModeValue("white", "gray.dark")}
					rounded={"xl"}
					boxShadow={"lg"}
					p={6}
				>
					<Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }}>
						User Profile Edit
					</Heading>

					<FormControl id="userName">
						<Stack direction={["column", "row"]} spacing={6}>
							<Center>
								<Avatar size="xl" boxShadow={"md"} src={imgUrl || user.profilePic} />
							</Center>
							<Center w="full">
								<Button w="full" onClick={() => fileRef.current.click()}>
									Change Avatar
								</Button>
								<Input type="file" hidden ref={fileRef} onChange={handleImageChange} />
							</Center>
						</Stack>
					</FormControl>

					{/* Full name */}
					<FormControl isInvalid={!!errors.name}>
						<FormLabel>Full name</FormLabel>
						<Input
							placeholder="John Doe"
							value={inputs.name}
							onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
							_placeholder={{ color: "gray.500" }}
							type="text"
						/>
						<FormErrorMessage>{errors.name}</FormErrorMessage>
					</FormControl>

					{/* Username */}
					<FormControl isInvalid={!!errors.username}>
						<FormLabel>User name</FormLabel>
						<Input
							placeholder="johndoe"
							value={inputs.username}
							onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
							_placeholder={{ color: "gray.500" }}
							type="text"
						/>
						<FormErrorMessage>{errors.username}</FormErrorMessage>
					</FormControl>

					{/* Email */}
					<FormControl isInvalid={!!errors.email}>
						<FormLabel>Email address</FormLabel>
						<Input
							placeholder="your-email@example.com"
							value={inputs.email}
							onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
							_placeholder={{ color: "gray.500" }}
							type="email"
						/>
						<FormErrorMessage>{errors.email}</FormErrorMessage>
					</FormControl>

					{/* Bio */}
					<FormControl>
						<FormLabel>Bio</FormLabel>
						<Input
							placeholder="Your bio."
							value={inputs.bio}
							onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
							_placeholder={{ color: "gray.500" }}
							type="text"
						/>
					</FormControl>

					{/* Password */}
					<FormControl isInvalid={!!errors.password}>
						<FormLabel>Password</FormLabel>
						<Input
							placeholder="password"
							value={inputs.password}
							onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
							_placeholder={{ color: "gray.500" }}
							type="password"
						/>
						<PasswordRequirement />
						<FormErrorMessage>{errors.password}</FormErrorMessage>
					</FormControl>

					<Stack spacing={6} direction={["column", "row"]}>
						<Button
							bg={"red.400"}
							color={"white"}
							w="full"
							_hover={{
								bg: "red.500",
							}}
							onClick={() => {
								// Optionally clear inputs or redirect/cancel
							}}
							type="button"
						>
							Cancel
						</Button>
						<Button
							bg={"green.400"}
							color={"white"}
							w="full"
							_hover={{
								bg: "green.500",
							}}
							type="submit"
							isLoading={updating}
						>
							Submit
						</Button>
					</Stack>
				</Stack>
			</Flex>
		</form>
	);
}
