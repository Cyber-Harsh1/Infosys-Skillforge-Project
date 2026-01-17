package com.skillforge.dto;

/**
 * AuthResponse Record
 * This DTO (Data Transfer Object) is sent back to the React frontend
 * after a successful login. It includes the JWT token and user profile details.
 */
public record AuthResponse(
        Long id,        // Unique user ID for fetching specific profile data
        String token,   // The JWT Bearer token for api.jsx interceptors
        String role,    // Used by App.jsx and ProtectedRoute.jsx for navigation
        String email,   // To display in the user's profile/header
        String name     // To personalize the dashboard greeting
) {}