package com.rowinglogbook.api.entity;

import com.rowinglogbook.api.enums.SessionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Positive;

@Entity
@Table(
        name = "session_crew",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_session_crew_session_member",
                columnNames = {"session_id", "member_id"}
        )
)
public class SessionCrew {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Positive
    @Column(name = "seat_number")
    private Integer seatNumber;

    public SessionCrew() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public Member getMember() {
        return member;
    }

    public void setMember(Member member) {
        this.member = member;
    }

    public Integer getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(Integer seatNumber) {
        this.seatNumber = seatNumber;
    }

    @PrePersist
    @PreUpdate
    void validateForClosedSession() {
        if (session != null && session.getStatus() == SessionStatus.CLOSED) {
            throw new IllegalStateException("Cannot add members to a closed session");
        }
    }
}
