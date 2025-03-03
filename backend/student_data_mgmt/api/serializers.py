from django.contrib.auth.models import User, Group
from rest_framework import serializers
from .models import Student, StudentMarks

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


class UserManagementSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    groups = GroupSerializer(many=True, read_only=True)
    group_ids = serializers.PrimaryKeyRelatedField(
        source='groups',
        queryset=Group.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email',
                  'is_active', 'password', 'confirm_password', 'groups', 'group_ids']

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)  # Remove confirm_password
        group_ids = validated_data.pop('groups', [])  # Get group IDs
        password = validated_data.pop('password', None)

        if User.objects.filter(username=validated_data['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken"})

        # Create user without groups
        user = User.objects.create(**validated_data)

        if password:
            user.set_password(password)
            user.save()

        # Assign groups using set()
        if group_ids:
            user.groups.set(group_ids)

        return user

    def update(self, instance, validated_data):
        validated_data.pop('confirm_password', None)  # Remove confirm_password
        group_ids = validated_data.pop('groups', None)  # Get group IDs
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        if group_ids is not None:
            instance.groups.set(group_ids)  # Update groups properly

        instance.save()
        return instance


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
