# PostgreSQL table creation files

Each `.sql` file contains the `CREATE TABLE`, constraints, and indexes for one table in the connected database.
Run the files against an empty PostgreSQL database in this dependency-safe order:

1. `applications_formdefinition.sql`
2. `auth_group.sql`
3. `auth_user.sql`
4. `awards_awardprogramme.sql`
5. `clubs_clubenquiry.sql`
6. `django_content_type.sql`
7. `django_migrations.sql`
8. `django_session.sql`
9. `events_event.sql`
10. `events_eventbriteconnection.sql`
11. `media_library_mediaasset.sql`
12. `memberships_membershipgrade.sql`
13. `newsletter_newslettersignup.sql`
14. `accounts_adminprofile.sql`
15. `applications_application.sql`
16. `auth_permission.sql`
17. `auth_user_groups.sql`
18. `awards_awardsinterest.sql`
19. `contact_contactsubmission.sql`
20. `django_admin_log.sql`
21. `events_eventregistration.sql`
22. `media_library_mediarendition.sql`
23. `memberships_membershipgradebenefit.sql`
24. `memberships_membershipgraderequirement.sql`
25. `applications_applicationevidence.sql`
26. `applications_applicationreference.sql`
27. `applications_applicationstatushistory.sql`
28. `applications_reviewernote.sql`
29. `auth_group_permissions.sql`
30. `auth_user_user_permissions.sql`

Regenerate after schema changes:

```powershell
.\.venv\Scripts\python.exe tools\export_database_schema.py
```
