package com.rowinglogbook.api.repository;

import com.rowinglogbook.api.entity.Boat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoatRepository extends JpaRepository<Boat, Long> {
}
