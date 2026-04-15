package com.rowinglogbook.api.controller;

import com.rowinglogbook.api.repository.MemberRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    record MemberSummary(Long id, String firstName, String lastName) {}

    private final MemberRepository memberRepository;

    public MemberController(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @GetMapping
    public List<MemberSummary> list() {
        return memberRepository.findAll().stream()
                .map(m -> new MemberSummary(m.getId(), m.getFirstName(), m.getLastName()))
                .toList();
    }
}
