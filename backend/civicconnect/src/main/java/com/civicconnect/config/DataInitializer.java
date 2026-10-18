package com.civicconnect.config;

import com.civicconnect.entity.Complaint;
import com.civicconnect.entity.User;
import com.civicconnect.repository.ComplaintRepository;
import com.civicconnect.repository.UserRepository;
import com.civicconnect.service.AIService;
import com.civicconnect.service.DepartmentRoutingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Data Initializer
 * Seeds the default Admin account and Demo Citizens with BCrypt encrypted passwords.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final PasswordEncoder passwordEncoder;
    private final AIService aiService;
    private final DepartmentRoutingService departmentRoutingService;

    public DataInitializer(UserRepository userRepository,
                           ComplaintRepository complaintRepository,
                           PasswordEncoder passwordEncoder,
                           AIService aiService,
                           DepartmentRoutingService departmentRoutingService) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.passwordEncoder = passwordEncoder;
        this.aiService = aiService;
        this.departmentRoutingService = departmentRoutingService;
    }

    @Override
    public void run(String... args) {
        // 1. Seed or Update Default Admin Account
        seedAdminUser();

        // 2. Seed Demo Citizens
        seedDemoCitizens();

        // 3. Seed Initial Sample Complaints
        seedSampleComplaints();
    }

    private void seedAdminUser() {
        String adminEmail = "admin@civicconnect.com";
        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
        if (existingAdmin.isEmpty()) {
            User admin = new User(
                    "Municipal Administrator",
                    adminEmail,
                    passwordEncoder.encode("admin123"),
                    "ADMIN"
            );
            userRepository.save(admin);
            System.out.println("✅ [Grievion Mission] Seeded Default Admin: " + adminEmail + " (Role: ADMIN)");
        }

        String grievionAdminEmail = "admin@grievionmission.com";
        Optional<User> existingGrievionAdmin = userRepository.findByEmail(grievionAdminEmail);
        if (existingGrievionAdmin.isEmpty()) {
            User admin2 = new User(
                    "Municipal Administrator",
                    grievionAdminEmail,
                    passwordEncoder.encode("admin123"),
                    "ADMIN"
            );
            userRepository.save(admin2);
            System.out.println("✅ [Grievion Mission] Seeded Default Admin: " + grievionAdminEmail + " (Role: ADMIN)");
        }
    }

    private void seedDemoCitizens() {
        seedCitizen("Faiz Ahmed", "faiz@test.com", "123456");
        seedCitizen("Arun Kumar", "arun@test.com", "123456");
    }

    private void seedCitizen(String name, String email, String rawPassword) {
        if (!userRepository.existsByEmail(email)) {
            User citizen = new User(
                    name,
                    email,
                    passwordEncoder.encode(rawPassword),
                    "CITIZEN"
            );
            userRepository.save(citizen);
            System.out.println("✅ [Grievion Mission] Seeded Citizen: " + email + " (Role: CITIZEN)");
        }
    }

    private void seedSampleComplaints() {
        if (complaintRepository.count() == 0) {
            createSampleComplaint(
                    "No water supply in Sector 4 for 48 hours",
                    "The main pipeline appears damaged near the community park. Over 80 households have had zero drinking water since yesterday morning.",
                    "Water",
                    "Sector 4, Green Avenue (Ward 12)",
                    "High",
                    "IN_PROGRESS",
                    1L,
                    "Faiz Ahmed",
                    14
            );

            createSampleComplaint(
                    "Damaged road with deep hazardous potholes",
                    "Multiple large potholes have formed after heavy rains. Two two-wheelers skidded last night. Immediate patching is urgent before accidents occur.",
                    "Roads",
                    "5th Cross, Near Metro Station, MG Road",
                    "High",
                    "PENDING",
                    2L,
                    "Arun Kumar",
                    28
            );

            createSampleComplaint(
                    "Street light not working along dark pedestrian lane",
                    "Three consecutive street lamps have been non-functional for over a week, making the stretch unsafe for night commuters.",
                    "Electricity",
                    "Lane 9, Rajendra Nagar",
                    "Low",
                    "RESOLVED",
                    1L,
                    "Faiz Ahmed",
                    8
            );

            createSampleComplaint(
                    "Garbage dump overflowing onto main street",
                    "Community waste collection bin has not been cleared for 4 days. Stray animals are scattering trash across the footpath.",
                    "Waste",
                    "Block C Market Area, Civil Lines",
                    "Medium",
                    "PENDING",
                    2L,
                    "Arun Kumar",
                    19
            );
        }
    }

    private void createSampleComplaint(String title, String desc, String category, String location,
                                       String priority, String status, Long createdBy, String createdByName, int supportCount) {
        Complaint c = new Complaint(title, desc, category, location, priority, createdBy, createdByName);
        c.setStatus(status);
        c.setSupportCount(supportCount);
        c.setDepartment(departmentRoutingService.suggestDepartment(category, title, desc));
        c.setAiSummary(aiService.generateSummary(desc));
        complaintRepository.save(c);
    }
}
