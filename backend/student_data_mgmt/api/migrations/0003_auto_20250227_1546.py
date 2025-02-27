from django.db import migrations

def create_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")

    # Define group permissions
    groups_permissions = {
        "admin": list(Permission.objects.all()),  # Admin gets all permissions
        "teacher": [
            "view_student",
            "add_student_marks",
            "change_student_marks",
            "view_student_marks",
        ],
        "student": [
            "view_student",
            "view_student_marks",
        ],
    }

    for group_name, perm_codenames in groups_permissions.items():
        group, created = Group.objects.get_or_create(name=group_name)
        if perm_codenames == list(Permission.objects.all()):  # Admin case
            group.permissions.set(perm_codenames)
        else:
            permissions = Permission.objects.filter(codename__in=perm_codenames)
            group.permissions.set(permissions)
        group.save()

class Migration(migrations.Migration):
    dependencies = [
        ("api", "0002_remove_user_groups_remove_user_user_permissions_and_more"),
    ]

    operations = [
        migrations.RunPython(create_groups),
    ]
