from rest_framework import viewsets, permissions
from .models import Attendance
from .serializers import AttendanceSerializer
from api.permissions import IsTeacherGroup

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        """ permissions"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsTeacherGroup()]  # teacher can modify
        return [permissions.IsAuthenticated()]  # Others can view

    def get_queryset(self):
        """Filter attendance records based on user role"""
        user = self.request.user
        if user.groups.filter(name="teacher").exists():
            return Attendance.objects.filter(teacher=user)
        elif user.groups.filter(name="student").exists():
            return Attendance.objects.filter(student=user)
        return super().get_queryset()

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)