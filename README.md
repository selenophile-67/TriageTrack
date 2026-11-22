# 🏥 TriageTrack – The Smart ER Visualizer

### The Right Care. At the Right Place. At the Right Time.

TriageTrack is an intelligent healthcare navigation platform designed to help patients find the most appropriate healthcare facilities based on their symptoms, medical urgency, location, and estimated waiting times.

It aims to reduce unnecessary overcrowding in hospital Emergency Rooms (ERs) by helping patients distinguish between emergency care, urgent care, and routine healthcare services.

Instead of simply finding the nearest hospital, TriageTrack helps users understand **where they should go, how urgently they need care, and which suitable healthcare facilities are available nearby.**

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Symptom Checker](#-smart-symptom-checker)
- [Traffic Light Healthcare Map](#-traffic-light-healthcare-map)
- [Healthcare AI Assistant](#-healthcare-ai-assistant)
- [Accessibility and Inclusivity](#-accessibility-and-inclusivity)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Application Pages](#-application-pages)
- [API Endpoints](#-api-endpoints)
- [Data Management](#-data-management)
- [Future Enhancements](#-future-enhancements)
- [Medical Disclaimer](#-medical-disclaimer)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 Overview

Healthcare systems frequently experience overcrowding because patients with minor, non-life-threatening health concerns visit hospital Emergency Rooms without knowing about alternative healthcare facilities.

This can lead to:
- Longer waiting times.
- Increased pressure on emergency departments.
- Unnecessary medical expenses.
- Delayed attention for critical patients.
- Difficulty identifying appropriate healthcare facilities.

**TriageTrack** addresses this problem through a centralized healthcare navigation platform that combines symptom-based guidance, healthcare facility discovery, waiting-time visualization, and community-powered updates.

The platform is designed to support patients across different age groups, including children, adults, senior citizens, pregnant individuals, and people with disabilities.

---

## 🚨 Problem Statement

Patients with minor, non-life-threatening health issues, such as deep cuts, sprained ankles, or high fever, often crowd hospital Emergency Rooms because they do not know where else to seek treatment.

This creates unnecessary pressure on emergency departments, increases patient waiting times, and makes it harder for critically ill patients to receive timely medical attention.

There is a need for an accessible healthcare navigation system that helps patients identify the appropriate level of care while considering medical urgency, facility capabilities, distance, and estimated waiting times.

---

## 💡 Our Solution

TriageTrack provides a smart healthcare navigation experience through:

1. **Intelligent Symptom Assessment** – Helps users understand the urgency of their symptoms.
2. **Healthcare Facility Discovery** – Finds nearby hospitals, clinics, urgent care centres, and primary healthcare centres.
3. **Traffic Light Wait-Time Visualization** – Displays estimated waiting times using colour-coded indicators.
4. **Facility Comparison** – Helps patients compare suitable healthcare facilities.
5. **Pre-Arrival Notifications** – Allows patients to notify facilities that they are on their way.
6. **Community-Powered Updates** – Collects voluntary waiting-room reports.
7. **Healthcare AI Assistant** – Provides general health information grounded in trusted medical references.
8. **Inclusive Healthcare Navigation** – Supports multiple languages, accessibility preferences, and different patient care profiles.

**Our core principle: Medical urgency always comes before convenience or shorter waiting times.**

---

## ✨ Key Features

### 1. 🚦 Traffic Light Healthcare Map

An interactive healthcare discovery experience that displays nearby medical facilities and their estimated waiting times.

**Colour-coded indicators:**

| Colour | Meaning |
|---|---|
| 🟢 Green | Shorter estimated waiting time |
| 🟡 Yellow | Moderate estimated waiting time |
| 🔴 Red | Longer estimated waiting time |
| ⚪ Grey | Waiting-time information unavailable |

Users can explore:
- Hospitals.
- Emergency departments.
- Urgent care centres.
- Clinics.
- Primary healthcare centres.
- Diagnostic centres.
- Pharmacies.

Each facility profile provides information such as:
- Facility name and address.
- Contact details.
- Operating hours.
- Available medical services.
- Medical specialties.
- Accessibility information.
- Estimated waiting time.
- Waiting-time information source.
- Last updated timestamp.

### 2. 🩺 Smart Symptom Checker

An interactive symptom assessment tool that helps users identify the appropriate level of healthcare.

Users can explore different symptom categories, including:

- Chest pain.
- Difficulty breathing.
- Fever.
- Cough and cold.
- Headache.
- Minor cuts.
- Sprains.
- Burns.
- Stomach pain.
- Vomiting and diarrhoea.
- Allergic reactions.
- Stroke-like symptoms.
- Other health concerns.

The assessment uses follow-up questions and warning-sign checks to determine an urgency category.

**Three urgency levels:**

- 🔴 RED – Immediate emergency assistance.
- 🟡 YELLOW – Prompt medical assessment.
- 🟢 GREEN – Routine or non-emergency healthcare assessment.

The recommendation engine considers warning signs and required healthcare capabilities before suggesting facilities.

### 3. 🏥 Smart Healthcare Facility Recommendation

Helps users identify suitable healthcare facilities by considering:

- Medical urgency.
- Required medical services.
- Facility capabilities.
- Estimated waiting time.
- Distance.
- Estimated travel time.
- Operating hours.
- Accessibility.

The system is designed to prioritize medically appropriate facilities rather than simply recommending the shortest queue.

### 4. 📊 Facility Comparison

Compare multiple healthcare facilities side by side.

Comparison parameters include:

- Estimated waiting time.
- Distance.
- Travel time.
- Available services.
- Medical specialties.
- Emergency department availability.
- Operating hours.
- Accessibility features.

### 5. 🚶 On My Way – Pre-Arrival Notification

Allows patients to submit basic pre-arrival information before visiting a healthcare facility.

Information includes:
- Initials or preferred display name.
- Age group.
- Healthcare facility.
- General reason for visit.
- Expected arrival window.

The application generates a unique reference code and displays facility-specific check-in instructions.

**Note:** This is a pre-arrival notification, not a guaranteed queue reservation or confirmed appointment.

### 6. 👥 Community-Powered Waiting-Time Updates

Allows patients to contribute voluntary updates about their waiting-room experience.

Users can report:
- Whether they are still waiting.
- Whether the waiting area is crowded.
- Approximate waiting duration.
- Whether the queue is moving.

The system includes:
- Timestamped reports.
- Expiration of outdated reports.
- Community waiting-time calculations.
- Suspicious-report detection.
- Report flagging.
- Administrative verification.

Waiting-time information is categorized by its source:

- Facility-confirmed.
- Community-reported.
- Estimated.
- Unavailable.

### 7. 🚑 Emergency Assistance Centre

Provides quick access to emergency information.

Features include:
- Emergency calling shortcut.
- Nearby emergency departments.
- Hospital contact information.
- Emergency guidance.
- Basic first-aid resources.

For India, the application provides access to the national emergency number **112**.

### 8. 🤖 Healthcare AI Assistant

An integrated healthcare information chatbot designed to answer general health-related questions.

Key capabilities:
- General health information.
- Symptom education.
- Common health-condition information.
- Basic first-aid information.
- Medical source references.
- Emergency keyword detection.
- Safe fallback responses when information cannot be verified.

The assistant uses Google Gemini with Google Search grounding when configured and an NIH MedlinePlus-based verification fallback.

It does not provide personal medical diagnoses or prescribe medications.

### 9. 🌐 Multilingual Support

TriageTrack currently supports three languages:

- English.
- Hindi.
- Odia.

The interface includes a language selector to make healthcare navigation more accessible.

### 10. ♿ Accessibility and Inclusive Healthcare

Designed to support different patient needs.

Includes:
- Adult care profile.
- Child care profile.
- Senior citizen care profile.
- Maternity-related facility discovery.
- Disability-related accessibility preferences.
- Larger text mode.
- Wheelchair accessibility information.
- Sign-language support information.

### 11. 👨‍👩‍👧 User Dashboard

Registered users can access:
- Personal profile.
- Preferred language.
- Accessibility preferences.
- Saved healthcare facilities.
- Recently viewed facilities.
- Search history.
- Pre-arrival notifications.
- Emergency contact information.

Account registration is optional for basic healthcare navigation.

### 12. 🔐 Administrator Dashboard

Provides administrative tools for managing the platform.

Administrators can:
- Manage healthcare facility listings.
- Update official waiting-time information.
- Monitor community reports.
- Verify or flag suspicious reports.
- Manage user accounts.
- Review user feedback.
- View platform analytics.
- Monitor facility usage trends.

---

## 🧠 Smart Symptom Checker

Patient safety is the foundation of TriageTrack.

The symptom checker evaluates reported symptoms and warning signs before suggesting an appropriate level of care.

| Urgency | Recommendation | Example |
|---|---|---|
| 🔴 RED | Immediate emergency assistance | Chest pain, stroke-like symptoms, severe bleeding |
| 🟡 YELLOW | Prompt medical assessment | Significant injuries, persistent fever, abdominal pain |
| 🟢 GREEN | Routine healthcare assessment | Minor cuts, mild sprains, uncomplicated cold symptoms |

The system uses a predefined symptom knowledge base and red-flag checks.

It is an informational navigation tool and must not be considered a clinically validated triage system.

---

## 🗺️ Traffic Light Healthcare Map

The healthcare discovery interface helps users explore facilities and compare their estimated waiting times.

The platform considers:

- Facility category.
- Medical services.
- Distance.
- Estimated travel time.
- Waiting-time information.
- Data freshness.
- Facility accessibility.

The system also distinguishes between official facility information and community-generated estimates.

This helps users understand the reliability of the information being displayed.

---

## 🤖 Healthcare AI Assistant

The healthcare chatbot uses a safety-focused information retrieval approach.

**Technologies and sources:**
- Google Gemini API.
- Google Search grounding.
- NIH MedlinePlus.
- Emergency keyword detection.
- Medical information fallback handling.

The assistant is designed to:
- Avoid unsupported medical claims.
- Avoid personalized diagnosis.
- Avoid medication prescriptions and dosage recommendations.
- Prioritize emergency guidance.
- Provide verified medical references where available.

If reliable information cannot be verified, the assistant falls back to:

`Ask from a medical specialist.`

---

## ♿ Accessibility and Inclusivity

TriageTrack aims to make healthcare navigation accessible to everyone.

| User Category | Supported Experience |
|---|---|
| Children | Pediatric healthcare discovery |
| Adults | General healthcare navigation |
| Senior Citizens | Large text and simplified navigation |
| Pregnant Individuals | Maternity-related facility discovery |
| People with Disabilities | Accessibility preferences and facility information |
| Regional Language Users | English, Hindi, and Odia |

---

## 🛠️ Technology Stack

### Frontend

- **React 19** – Component-based user interface.
- **TypeScript** – Type safety and maintainable code.
- **Tailwind CSS 4** – Responsive styling.
- **React Router 7** – Application navigation.
- **Lucide React** – Icons.
- **Motion** – UI animations.
- **Recharts** – Data visualization.

### Backend

- **Node.js** – Server-side runtime.
- **Express.js** – REST API and backend services.
- **TypeScript** – Backend development.
- **tsx** – TypeScript execution.

### AI and Healthcare Information

- **Google Gemini API** – Healthcare information assistant.
- **Google Search grounding** – Medical information verification.
- **NIH MedlinePlus** – Trusted medical reference fallback.

### Data Storage

- Local JSON-based persistent storage.
- Browser LocalStorage for selected client-side preferences and pre-arrival information.

### Mapping and Location

- Interactive map components.
- Geographic facility coordinates.
- Browser geolocation support.

---

## 📂 Project Structure

```text
TriageTrack/
│
├── public/
│   └── assets/
│       └── aistudio/
│
├── server/
│   ├── medicalGrounder.ts
│   └── store.ts
│
├── src/
│   ├── assets/
│   │   └── images/
│   │
│   ├── components/
│   │   ├── FacilityCard.tsx
│   │   ├── HealthChatbot.tsx
│   │   ├── Layout.tsx
│   │   └── TrafficLightMap.tsx
│   │
│   ├── context/
│   │   └── AppContext.tsx
│   │
│   ├── data/
│   │   ├── i18n.ts
│   │   └── triageKnowledge.ts
│   │
│   ├── pages/
│   │   ├── AboutPage.tsx
│   │   ├── AdminDashboardPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── CompareFacilitiesPage.tsx
│   │   ├── EmergencyHelpPage.tsx
│   │   ├── FacilityDetailsPage.tsx
│   │   ├── FindHealthcarePage.tsx
│   │   ├── HealthAssistantPage.tsx
│   │   ├── HealthResourcesPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── PrivacyPage.tsx
│   │   ├── SymptomCheckerPage.tsx
│   │   └── UserDashboardPage.tsx
│   │
│   ├── types/
│   │   └── triage.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
└── bun.lock
```

---

## 🚀 Getting Started

Follow these instructions to run TriageTrack locally.

### Prerequisites

Make sure you have installed:

- Node.js (LTS recommended).
- npm or Bun.
- Git.
- A code editor such as Visual Studio Code.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/TriageTrack.git
```

### 2. Navigate to the Project Directory

```bash
cd TriageTrack
```

### 3. Install Dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

Use the following template:

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
SESSION_SECRET=your_long_random_secret
```

`GEMINI_API_KEY` is optional for the basic application. It enables the Gemini-powered healthcare assistant when configured.

`SESSION_SECRET` should be a long, random secret for production deployments. The current server generates a temporary secret automatically if one is not supplied.

### 5. Start the Development Server

Using npm:

```bash
npm run dev
```

Or using Bun:

```bash
bun run dev
```

### 6. Open the Application

Visit:

```text
http://localhost:3000
```

The Express server runs the application and serves the Vite development middleware.

---

## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for the AI healthcare assistant | Optional |
| `APP_URL` | Application hosting URL | Optional |
| `SESSION_SECRET` | Secret used to sign authentication sessions | Recommended |

Never upload your actual `.env` file or API keys to GitHub.

---

## 📱 Application Pages

| Page | Route | Description |
|---|---|---|
| Home | `/` | Main landing page |
| Symptom Checker | `/symptom-checker` | Symptom assessment |
| Find Healthcare | `/find-healthcare` | Nearby healthcare discovery |
| Facility Details | `/facilities/:id` | Individual facility information |
| Compare Facilities | `/compare` | Facility comparison |
| Emergency Help | `/emergency` | Emergency resources |
| Health Resources | `/resources` | Health education |
| Healthcare AI Assistant | `/health-assistant` | AI-powered information assistant |
| Authentication | `/auth` | Login and registration |
| User Dashboard | `/dashboard` | User preferences and saved facilities |
| Admin Dashboard | `/admin` | Administrative management |
| About | `/about` | Project information |
| Privacy | `/privacy` | Privacy information |

---

## 🔌 API Endpoints

TriageTrack includes an Express REST API.

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check server status |

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth/me` | Retrieve authenticated user |
| POST | `/api/auth/register` | Register a new account |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/auth/logout` | Log out |
| PATCH | `/api/auth/profile` | Update user profile |
| DELETE | `/api/auth/account` | Delete user account |

### Healthcare Facilities

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/facilities` | Retrieve all facilities |
| GET | `/api/facilities/:id` | Retrieve facility details |
| POST | `/api/facilities` | Add a facility (admin) |
| PATCH | `/api/facilities/:id` | Update facility (admin) |
| DELETE | `/api/facilities/:id` | Delete facility (admin) |
| POST | `/api/facilities/:id/official-wait` | Update official waiting time (admin) |

### Community Reports

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/facilities/:id/reports` | Submit waiting-room report |
| POST | `/api/reports/:reportId/flag` | Flag an inaccurate report |
| PATCH | `/api/admin/reports/:id` | Moderate a report (admin) |

### Pre-Arrival Notifications

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/pre-arrival` | Submit pre-arrival notification |
| GET | `/api/pre-arrival/mine` | Retrieve personal notifications |
| PATCH | `/api/pre-arrival/:id/cancel` | Cancel a notification |

### Feedback and Analytics

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/feedback` | Submit feedback |
| POST | `/api/analytics/symptom-search` | Record symptom search |

### Administrator APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/overview` | Retrieve platform statistics |
| GET | `/api/admin/users` | Retrieve user information |
| GET | `/api/admin/feedback` | Retrieve feedback |
| PATCH | `/api/admin/feedback/:id` | Update feedback status |

### Healthcare AI Assistant

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/health-chat` | Submit healthcare information questions |

Administrative endpoints require an authenticated account with the administrator role.

---

## 💾 Data Management

The backend uses a local JSON-based storage mechanism.

Application data is stored in:

```text
data/
└── triage-store.json
```

The store is initialized with demonstration healthcare facilities and sample information when no existing data file is present.

It maintains:
- User accounts.
- Healthcare facility information.
- Community reports.
- Official waiting-time updates.
- Pre-arrival notifications.
- Feedback.
- Platform analytics.

**Important:** This storage approach is intended for development and demonstration. A production deployment should migrate to a managed database with appropriate backup, concurrency, security, and access-control mechanisms.

---

## 🔮 Future Enhancements

TriageTrack is designed to evolve into a more comprehensive healthcare navigation ecosystem.

Potential future improvements include:

- Real-time hospital waiting-time integrations.
- Verified hospital queue APIs.
- Ambulance service integrations.
- Hospital appointment scheduling.
- Advanced AI-assisted symptom assessment reviewed by clinicians.
- More regional Indian languages.
- Voice-based navigation.
- Hospital bed availability integrations.
- Telemedicine integrations.
- Pharmacy and diagnostic service discovery.
- Push notifications for facility updates.
- Advanced crowd-report reliability scoring.
- Production-grade cloud database integration.
- Hospital management system integrations.
- Enhanced accessibility features.

---

## ⚠️ Medical Disclaimer

TriageTrack is an informational healthcare navigation platform.

It does not:
- Provide definitive medical diagnoses.
- Prescribe medications.
- Replace doctors or qualified healthcare professionals.
- Guarantee hospital waiting times.
- Guarantee appointments or queue positions.
- Dispatch ambulances directly.

All waiting-time information should be treated according to its displayed source and freshness.

The symptom checker is a preliminary informational tool, not a clinically validated triage service.

**In a medical emergency, seek immediate professional medical assistance. Do not delay emergency care to compare waiting times.**

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome!

To contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Implement your changes.
4. Test your implementation.
5. Commit your changes.
6. Open a Pull Request.

Example:

```bash
git checkout -b feature/new-feature
git add .
git commit -m "Add new healthcare feature"
git push origin feature/new-feature
```

---

## 📜 License

This project is currently provided for educational, demonstration, and hackathon purposes.

Add an appropriate open-source license to the repository before distributing or reusing the project.

---

## 📖 Acknowledgements

- [Google AI Studio](https://aistudio.google.com/apps) – AI-powered development platform used during project development.
- The open-source developer community for the tools and libraries used in this project.

---

## 👩‍💻 Author

**Oishee Biswas**

GitHub: [@selenophile-67](https://github.com/selenophile-67)

---

⭐ If you find this project interesting, consider giving the repository a star!

**Made with ❤️ and a passion for building cinematic web experiences.**

---

## 🩺 Our Vision

We believe that finding the right healthcare facility should not be complicated.

TriageTrack aims to make healthcare navigation smarter, faster, safer, and more accessible by connecting patients with appropriate healthcare services.

**Because the right care at the right time can make all the difference.**

### 🏥 TriageTrack – The Right Care. At the Right Place. At the Right Time.

