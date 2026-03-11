package com.rowinglogbook.api.repository;

import com.rowinglogbook.api.entity.Session;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findAllByOrderByStartTimeDesc();
}
