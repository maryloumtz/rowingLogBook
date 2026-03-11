package com.rowinglogbook.api.entity;

import com.rowinglogbook.api.enums.SessionStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "session")
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "boat_id", nullable = false)
    private Boat boat;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private Member createdBy;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SessionStatus status;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SessionCrew> crewMembers = new ArrayList<>();

    public Session() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boat getBoat() {
        return boat;
    }

    public void setBoat(Boat boat) {
        this.boat = boat;
    }

    public Member getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Member createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public List<SessionCrew> getCrewMembers() {
        return crewMembers;
    }

    public void setCrewMembers(List<SessionCrew> crewMembers) {
        this.crewMembers = crewMembers;
    }

    public void addCrewMember(SessionCrew sessionCrew) {
        if (status == SessionStatus.CLOSED) {
            throw new IllegalStateException("Cannot add members to a closed session");
        }
        Long memberId = sessionCrew.getMember() != null ? sessionCrew.getMember().getId() : null;
        if (memberId != null) {
            boolean duplicate = crewMembers.stream()
                    .anyMatch(existing -> existing.getMember() != null
                            && memberId.equals(existing.getMember().getId()));
            if (duplicate) {
                throw new IllegalStateException("Member already exists in this session");
            }
        }
        sessionCrew.setSession(this);
        this.crewMembers.add(sessionCrew);
    }

    public void removeCrewMember(SessionCrew sessionCrew) {
        this.crewMembers.remove(sessionCrew);
        sessionCrew.setSession(null);
    }

    @PrePersist
    @PreUpdate
    void validateTimesAndDuplicates() {
        if (endTime != null && endTime.isBefore(startTime)) {
            throw new IllegalStateException("endTime cannot be before startTime");
        }
        Set<Long> memberIds = new HashSet<>();
        for (SessionCrew crewMember : crewMembers) {
            if (crewMember.getMember() == null || crewMember.getMember().getId() == null) {
                continue;
            }
            if (!memberIds.add(crewMember.getMember().getId())) {
                throw new IllegalStateException("A member cannot appear twice in the same session");
            }
        }
    }
}
