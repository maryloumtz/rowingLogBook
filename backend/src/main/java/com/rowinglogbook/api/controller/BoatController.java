package com.rowinglogbook.api.controller;

import com.rowinglogbook.api.dto.boat.BoatResponse;
import com.rowinglogbook.api.repository.BoatRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/boats")
public class BoatController {

    private final BoatRepository boatRepository;

    public BoatController(BoatRepository boatRepository) {
        this.boatRepository = boatRepository;
    }

    @GetMapping
    public List<BoatResponse> list() {
        return boatRepository.findAll().stream()
                .map(BoatResponse::from)
                .toList();
    }
}
