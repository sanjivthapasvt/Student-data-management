from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Student, StudentMarks

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'confirm_password')

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        if User.objects.filter(username=validated_data['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken"})
            
        if User.objects.filter(email=validated_data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already registered"})
        
        user = User(**validated_data)
        user.set_password(password)  # Hash the password
        user.save()
        return user


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'


class StudentMarksSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source='student',
        write_only=True
    )

    class Meta:
        model = StudentMarks
        fields = '__all__'
        extra_kwargs = {
            'student_class': {'read_only': True} 
        }

    def validate(self, data):
        student = data.get('student')
        student_class = data.get('student_class')

        if StudentMarks.objects.filter(student=student, student_class=student_class).exists():
            raise serializers.ValidationError(
                {"detail": "This student already has marks for this class"}
            )
        return data