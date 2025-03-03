from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'date', 'status'] 
    def create(self, validated_data):
        student = validated_data.get('student')
        request = self.context.get('request') 
        teacher = request.user if request else None  #Assign teacher automatically
        date = validated_data.get('date')

        # Ensure date is correct
        if date is None:
            from datetime import date
            date = date.today()

        # Check if the student already has attendance for today with this teacher
        if Attendance.objects.filter(student=student, teacher=teacher, date=date).exists():
            raise serializers.ValidationError({"detail": "This student already has attendance for today with this teacher."})

        return super().create({**validated_data, 'teacher': teacher}) 
