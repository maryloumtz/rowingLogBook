package com.rowinglogbook.api.service;

import com.rowinglogbook.api.dto.session.SessionCloseRequest;
import com.rowinglogbook.api.dto.session.SessionCreateRequest;
import com.rowinglogbook.api.dto.session.SessionResponse;
import com.rowinglogbook.api.entity.Boat;
import com.rowinglogbook.api.entity.Member;
import com.rowinglogbook.api.entity.Session;
import com.rowinglogbook.api.enums.SessionStatus;
import com.rowinglogbook.api.exception.BadRequestException;
import com.rowinglogbook.api.exception.ConflictException;
import com.rowinglogbook.api.exception.ResourceNotFoundException;
import com.rowinglogbook.api.repository.BoatRepository;
import com.rowinglogbook.api.repository.MemberRepository;
import com.rowinglogbook.api.repository.SessionRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;
    private final BoatRepository boatRepository;
    private final MemberRepository memberRepository;

    public SessionService(
            SessionRepository sessionRepository,
            BoatRepository boatRepository,
            MemberRepository memberRepository
    ) {
        this.sessionRepository = sessionRepository;
        this.boatRepository = boatRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional
    public SessionResponse create(SessionCreateRequest request) {
        Boat boat = boatRepository.findById(request.boatId())
                .orElseThrow(() -> new ResourceNotFoundException("Boat not found with id " + request.boatId()));
        Member createdBy = memberRepository.findById(request.createdById())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id " + request.createdById()));

        Session session = new Session();
        session.setBoat(boat);
        session.setCreatedBy(createdBy);
        session.setStartTime(request.startTime());
        session.setStatus(SessionStatus.OPEN);
        session.setEndTime(null);

        Session saved = sessionRepository.save(session);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> listAll() {
        return sessionRepository.findAllByOrderByStartTimeDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SessionResponse close(Long sessionId, SessionCloseRequest request) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id " + sessionId));

        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new ConflictException("Session is already closed");
        }

        Instant effectiveEndTime = request != null && request.endTime() != null
                ? request.endTime()
                : Instant.now();

        if (effectiveEndTime.isBefore(session.getStartTime())) {
            throw new BadRequestException("endTime cannot be before startTime");
        }

        session.setEndTime(effectiveEndTime);
        session.setStatus(SessionStatus.CLOSED);
        Session saved = sessionRepository.save(session);
        return toResponse(saved);
    }

    private SessionResponse toResponse(Session session) {
        return new SessionResponse(
                session.getId(),
                session.getBoat().getId(),
                session.getBoat().getName(),
                session.getCreatedBy().getId(),
                session.getCreatedBy().getFirstName() + " " + session.getCreatedBy().getLastName(),
                session.getStartTime(),
                session.getEndTime(),
                session.getStatus(),
                session.getCrewMembers().size()
        );
    }
}
