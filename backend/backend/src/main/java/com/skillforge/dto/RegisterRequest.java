package com.skillforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    private String fullName;
    private String email;

    @JsonProperty("password") // Maps React "password" to this field
    private String rawPassword;

    private String phoneNumber;
    private String college;
    private String role;

    // Manually add this if Lombok is acting up in your IDE
    public String getRawPassword() {
        return this.rawPassword;
    }
}