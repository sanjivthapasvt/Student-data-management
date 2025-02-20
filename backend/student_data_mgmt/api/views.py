from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
from .serializers import UserSerializer, StudentSerializer
from .models import Student
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


#For authentication created Register, Login and Logout views
class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "User created successfully",
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                "error": "Please provide both username and password"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(username=username).first()
        
        if user and check_password(password, user.password):
            refresh = RefreshToken.for_user(user)
            return Response({
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_200_OK)
            
        return Response({
            "error": "Invalid credentials"
        }, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({
                "message": "Successfully logged out"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            # Still return success even if token blacklisting fails
            return Response({
                "message": "Logged out"
            }, status=status.HTTP_200_OK)
            
class StudentCreate(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can add students
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        query = request.query_params.get('search', '')
        students = Student.objects.filter(name__icontains=query)
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)


class StudentDetail(APIView):

    def get_permissions(self):
        # Allow GET requests without authentication
        if self.request.method == 'GET':
            return []
        # Require authentication for PUT and DELETE
        return [IsAuthenticated()]

    # Retrieve a student (GET request)
    def get(self, request, id):
        student = get_object_or_404(Student, id=id)
        serializer = StudentSerializer(student)
        return Response(serializer.data)

    # Update a student (PUT request)
    def put(self, request, id):
        student = get_object_or_404(Student, id=id)
        serializer = StudentSerializer(student, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Delete a student (DELETE request)
    def delete(self, request, id):
        student = get_object_or_404(Student, id=id)
        student.delete()
        return Response({"message": "Student deleted successfully"}, status=status.HTTP_204_NO_CONTENT)