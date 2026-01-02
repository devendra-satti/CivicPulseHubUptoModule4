package com.civicpulse.backend.repository;

import com.civicpulse.backend.model.ComplaintHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintHistoryRepository extends JpaRepository<ComplaintHistory, Integer> {
    List<ComplaintHistory> findByComplaintIdOrderByTimestampDesc(Integer complaintId);
}