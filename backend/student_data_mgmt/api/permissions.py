from rest_framework.permissions import BasePermission
class IsAdminGroup(BasePermission):
    def has_permission(self, request, view):
        # Check if user is authenticated and in admin group
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_superuser or request.user.groups.filter(name='admin').exists())
        )
class IsTeacherGroup(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='teacher').exists()

class IsStudentGroup(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='student').exists()

class IsAdminOrTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name__in=['admin', 'teacher']).exists()        

