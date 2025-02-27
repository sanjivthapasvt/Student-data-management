from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User, Group
from .permissions import IsAdminGroup
from .serializers import UserManagementSerializer, GroupSerializer


class UserManagementList(APIView):
    permission_classes = [IsAdminGroup]
    
    def get(self, request):
        users = User.objects.all()
        serializer = UserManagementSerializer(users, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = UserManagementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserManagementDetail(APIView):
    permission_classes = [IsAdminGroup]
    
    def get_object(self, id):
        try:
            return User.objects.get(id=id)
        except User.DoesNotExist:
            return None
    
    def get(self, request, id):
        user = self.get_object(id)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserManagementSerializer(user)
        return Response(serializer.data)
    
    def put(self, request, id):
        user = self.get_object(id)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserManagementSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        user = self.get_object(id)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Optional: Group management endpoints
class GroupList(APIView):
    permission_classes = [IsAdminGroup]
    
    def get(self, request):
        groups = Group.objects.all()
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)