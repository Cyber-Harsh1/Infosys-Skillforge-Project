package com.skillforge.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})// Added /api to match your SecurityConfig
public class UserController {

    @Autowired
    private DataSource dataSource;

    // GET ALL USERS (Included password check logic)
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        List<Map<String, Object>> users = new ArrayList<>();
        // Select 'password' only if you strictly need to check hash status
        String query = "SELECT id, name, email, password, phone, college, role FROM users";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Map<String, Object> user = new HashMap<>();
                user.put("id", rs.getInt("id"));
                user.put("name", rs.getString("name"));
                user.put("email", rs.getString("email"));
                user.put("phone", rs.getString("phone"));
                user.put("college", rs.getString("college"));
                user.put("role", rs.getString("role"));

                // Security Note: Never send the actual password hash to the frontend!
                // We just check if it exists or is hashed
                String pwd = rs.getString("password");
                user.put("hasValidPassword", (pwd != null && pwd.startsWith("$2a$")));

                users.add(user);
            }
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error fetching users"));
        }
    }

    // GET USER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable int id) {
        String query = "SELECT id, name, email, phone, college, role FROM users WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return ResponseEntity.status(404).body(Map.of("error", "User not found"));
                }

                Map<String, Object> user = new HashMap<>();
                user.put("id", rs.getInt("id"));
                user.put("name", rs.getString("name"));
                user.put("email", rs.getString("email"));
                user.put("phone", rs.getString("phone"));
                user.put("college", rs.getString("college"));
                user.put("role", rs.getString("role"));

                return ResponseEntity.ok(user);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error fetching user"));
        }
    }

    // DELETE USER (Crucial for cleaning up those IDs 4 and 5!)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        try (Connection conn = dataSource.getConnection()) {
            // Disable FK checks if you have linked quiz attempts
            try (Statement st = conn.createStatement()) {
                st.execute("SET FOREIGN_KEY_CHECKS=0");
            }

            PreparedStatement stmt = conn.prepareStatement("DELETE FROM users WHERE id = ?");
            stmt.setInt(1, id);
            int rowsAffected = stmt.executeUpdate();

            try (Statement st = conn.createStatement()) {
                st.execute("SET FOREIGN_KEY_CHECKS=1");
            }

            if (rowsAffected == 0) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(Map.of("message", "User " + id + " deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}