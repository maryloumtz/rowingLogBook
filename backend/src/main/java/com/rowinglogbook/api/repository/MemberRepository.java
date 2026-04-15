package com.rowinglogbook.api.repository;

import com.rowinglogbook.api.entity.Member;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmailIgnoreCase(String email);
}
