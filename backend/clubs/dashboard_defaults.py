"""Editable defaults for the four public regional club pages."""


CLUBS = (
    {
        "id": "london",
        "name": "London Club",
        "location": "London",
        "summary": "A central professional hub for project-controls practice.",
        "description": "London activity connects Master Classes with senior roundtables, speakers, consultancies, employers, academics and professionals working across major projects.",
        "specialism": "Technical depth, leadership and cross-sector professional exchange.",
    },
    {
        "id": "nottingham",
        "name": "Nottingham Club",
        "location": "Nottingham",
        "summary": "Connect regional practice, education and professional development.",
        "description": "Nottingham activity supports local practitioners, academic partners, learners and employers through talks, networking, mentoring and professional-development sessions.",
        "specialism": "Regional practice exchange, education and employability.",
    },
    {
        "id": "manchester",
        "name": "Manchester Club",
        "location": "Manchester",
        "summary": "Share project-controls practice across sectors and career stages.",
        "description": "Manchester activity brings together professionals from major projects, consultancies, infrastructure, technology, education and regional employers.",
        "specialism": "Cross-sector exchange, employer connection and emerging talent.",
    },
    {
        "id": "kent-maidstone",
        "name": "Kent–Maidstone Club",
        "location": "Kent–Maidstone",
        "summary": "Build a connected project-controls community in Kent.",
        "description": "Kent–Maidstone activity links the Institute’s Maidstone base with local employers, consultants, academic partners, learners and practitioners.",
        "specialism": "Local capability, learner development and employer engagement.",
    },
)


def _club_page(club):
    name = club["name"]
    location = club["location"]
    return {
        **club,
        "slug": club["id"],
        "hero": {
            "eyebrow": "IPC regional community",
            "title": name,
            "summary": club["summary"],
            "primary_cta_label": "Join this club",
            "secondary_cta_label": "Explore the programme",
            "notice": "Club participation is available to active IPC members. Join requests are reviewed before community access is enabled.",
        },
        "profile": {
            "eyebrow": "Club profile",
            "region_label": "Region",
            "focus_label": "Professional focus",
            "community_label": "Community",
            "community": "IPC member-led and professionally governed",
        },
        "metrics": {
            "members_label": "Active club members",
            "discussions_label": "Member discussions",
            "events_label": "Upcoming regional events",
        },
        "about": {
            "eyebrow": "About this club",
            "title": "Professional knowledge with a regional connection.",
            "description": club["description"],
            "focus_label": "Professional focus",
            "specialism": club["specialism"],
        },
        "programme": {
            "eyebrow": "Member programme",
            "title": "Learn, connect, contribute and progress.",
            "items": [
                {
                    "id": "events",
                    "icon": "calendar",
                    "title": "Attend regional events",
                    "description": "Join professional talks, workshops, roundtables, site visits and networking sessions.",
                },
                {
                    "id": "cpd",
                    "icon": "book",
                    "title": "Develop your CPD",
                    "description": "Build current knowledge through practical learning and evidence-led professional discussion.",
                },
                {
                    "id": "insight",
                    "icon": "message",
                    "title": "Share professional insight",
                    "description": "Exchange experience, start discussions and contribute useful regional case studies.",
                },
                {
                    "id": "contribute",
                    "icon": "network",
                    "title": "Connect and contribute",
                    "description": "Meet peers across sectors and support mentoring, volunteering and working-group activity.",
                },
            ],
        },
        "calendar": {
            "eyebrow": "Club calendar",
            "title": "Upcoming regional activity",
            "all_events_label": "View all IPC events",
            "empty_title": "New activity is being prepared",
            "empty_description": f"Confirmed {name} events will appear here when published.",
        },
        "final_cta": {
            "eyebrow": "Your regional professional community",
            "title": f"Take part in {name}.",
            "member_button_label": "Open member hub",
            "join_button_label": "Request to join",
            "pending_button_label": "Request pending",
        },
        "seo": {
            "title": f"{name} | Institute of Project Controls",
            "description": f"Join the IPC {name} professional community for project-controls learning, events, networking and contribution.",
            "canonical_path": f"/clubs/{club['id']}",
        },
    }


def default_club_pages():
    return [_club_page(club) for club in CLUBS]
