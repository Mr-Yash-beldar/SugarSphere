import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Edit, Save, PhotoCamera } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/users";
import { useAuthStore } from "@/store";
import toast from "react-hot-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      return usersApi.updateProfile(formData);
    },
    onSuccess: (response) => {
      if (response.data?.user) {
        setUser(response.data.user);
        toast.success("Profile updated successfully");
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: usersApi.updatePassword,
    onSuccess: () => {
      toast.success("Password updated successfully");
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update password");
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    updatePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
        My Profile
      </Typography>

      {/* Profile Information */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5">Profile Information</Typography>
          {!isEditing && (
            <Button startIcon={<Edit />} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Box
          component="form"
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  src={avatarPreview || user?.avatarUrl}
                  alt={user?.name}
                  sx={{ width: 150, height: 150, fontSize: "4rem" }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                {isEditing && (
                  <label htmlFor="avatar-upload">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarChange}
                    />
                    <Button
                      component="span"
                      variant="contained"
                      size="small"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        minWidth: 40,
                        borderRadius: "50%",
                        p: 1,
                      }}
                    >
                      <PhotoCamera fontSize="small" />
                    </Button>
                  </label>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    {...profileForm.register("name")}
                    error={!!profileForm.formState.errors.name}
                    helperText={profileForm.formState.errors.name?.message}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    {...profileForm.register("email")}
                    error={!!profileForm.formState.errors.email}
                    helperText={profileForm.formState.errors.email?.message}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={
                      user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)
                    }
                    disabled
                  />
                </Grid>
              </Grid>
            </Grid>

            {isEditing && (
              <Grid
                item
                xs={12}
                sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                    profileForm.reset();
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    updateProfileMutation.isPending ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Save />
                    )
                  }
                  disabled={updateProfileMutation.isPending}
                >
                  Save Changes
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>

      {/* Change Password */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Change Password
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box
          component="form"
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                {...passwordForm.register("currentPassword")}
                error={!!passwordForm.formState.errors.currentPassword}
                helperText={
                  passwordForm.formState.errors.currentPassword?.message
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                {...passwordForm.register("newPassword")}
                error={!!passwordForm.formState.errors.newPassword}
                helperText={passwordForm.formState.errors.newPassword?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                {...passwordForm.register("confirmPassword")}
                error={!!passwordForm.formState.errors.confirmPassword}
                helperText={
                  passwordForm.formState.errors.confirmPassword?.message
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  updatePasswordMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Save />
                  )
                }
                disabled={updatePasswordMutation.isPending}
              >
                Update Password
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};
