from django.contrib.auth import authenticate
from django.contrib.auth.models import User, Group
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.generics import GenericAPIView, CreateAPIView
from rest_framework import status, viewsets
from .serializers import UserManagementSerializer, StudentSerializer, StudentMarksSerializer, GroupSerializer
from .models import Student, StudentMarks
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .permissions import IsAdminGroup, IsAdminOrTeacher

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserManagementSerializer
    permission_classes = [IsAdminUser]

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAdminUser]

class RegisterView(CreateAPIView):
    permission_classes = [IsAdminGroup]  
    
    def post(self, request):
        serializer = UserManagementSerializer(data=request.data)
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

class LoginView(GenericAPIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({"error": "Please provide both username and password"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": "Error logging out", "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class StudentCreate(GenericAPIView):
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAdminGroup()]
            
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

class StudentDetail(GenericAPIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return []
        return [IsAdminGroup()]
        
    def get(self, request, id):
        student = get_object_or_404(Student, id=id)
        serializer = StudentSerializer(student)
        return Response(serializer.data)
        
    def put(self, request, id):
        student = get_object_or_404(Student, id=id)
        serializer = StudentSerializer(student, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, id):
        student = get_object_or_404(Student, id=id)
        student.delete()
        return Response({"message": "Student deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class StudentsMarks(GenericAPIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return []
        return [IsAdminOrTeacher()]
    
    def get(self, request, id=None):
        if id:
            student_marks = StudentMarks.objects.filter(student_id=id)
            if not student_marks.exists():
                return Response({"message": "Student marks not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            student_marks = StudentMarks.objects.all()
        serializer = StudentMarksSerializer(student_marks, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = StudentMarksSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            created_marks = StudentMarks.objects.get(id=serializer.data['id'])
            response_serializer = StudentMarksSerializer(created_marks)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, id):
        marks = get_object_or_404(StudentMarks, student_id=id)
        serializer = StudentMarksSerializer(marks, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        marks = get_object_or_404(StudentMarks, student_id=id)
        marks.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
