from app.models.user import UserRole


def test_admin_enum_alias_exists():
    assert UserRole.ADMIN is UserRole.ADMINISTRATOR
    assert UserRole.ADMIN.value == "Administrator"
