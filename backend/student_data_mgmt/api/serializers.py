from rest_framework import serializers
from .models import student
class studentSerializer(serializers.Serializer):
    class Meta:
        model = student
        fields = ['id', 'name', 'roll', 'city', 'Class', 'photo']