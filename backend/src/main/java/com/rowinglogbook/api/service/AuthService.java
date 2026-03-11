package com.rowinglogbook.api.service;

import com.rowinglogbook.api.dto.auth.AuthLoginRequest;
import com.rowinglogbook.api.dto.auth.AuthRegisterRequest;
import com.rowinglogbook.api.dto.auth.AuthResponse;
import com.rowinglogbook.api.dto.auth.AuthUserResponse;
import com.rowinglogbook.api.entity.Member;
import com.rowinglogbook.api.enums.MemberRole;
import com.rowinglogbook.api.exception.ConflictException;
import com.rowinglogbook.api.exception.UnauthorizedException;
import com.rowinglogbook.api.repository.MemberRepository;
import com.rowinglogbook.api.security.JwtService;
import com.rowinglogbook.api.security.MemberPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            MemberRepository memberRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(AuthRegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (memberRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new ConflictException("Email is already in use");
        }

        Member member = new Member();
        member.setFirstName(request.firstName().trim());
        member.setLastName(request.lastName().trim());
        member.setEmail(normalizedEmail);
        member.setPhone(request.phone());
        member.setRole(MemberRole.ROWER);
        member.setPasswordHash(passwordEncoder.encode(request.password()));

        Member saved = memberRepository.save(member);
        return buildAuthResponse(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthLoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        Member member = memberRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (member.getPasswordHash() == null || !passwordEncoder.matches(request.password(), member.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return buildAuthResponse(member);
    }

    @Transactional(readOnly = true)
    public AuthUserResponse me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof MemberPrincipal principal)) {
            throw new UnauthorizedException("Authentication required");
        }

        Member member = memberRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("Authenticated user no longer exists"));

        return toUserResponse(member);
    }

    private AuthResponse buildAuthResponse(Member member) {
        String token = jwtService.generateToken(member);
        return new AuthResponse(
                token,
                "Bearer",
                jwtService.extractExpiration(token),
                toUserResponse(member)
        );
    }

    private AuthUserResponse toUserResponse(Member member) {
        return new AuthUserResponse(
                member.getId(),
                member.getFirstName(),
                member.getLastName(),
                member.getEmail(),
                member.getRole()
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
