from rest_framework import generics
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import StudentSerializer
from .models import Student
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')
        if password != confirm_password:
            return Response({"message": "Password do not match"}, status=400)
        
        user = User.objects.create_user(username=username, email=email, password=password)
        return Response({"message": "User Created sucessfully"}, status=201)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = User.objects.filter(username=username).first()
        
        if user and check_password(password, user.password):
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            })
        return Response({"message": "Wrong Credentials"}, status=400)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"messsage": "Sucessfully logged out"}, status=200)
        except Exception:
            return Response({"error": "invalid token"}, status=400)
        
        
# class StudentListCreate(generics.ListCreateAPIView):
#     queryset = Student.objects.all()
#     serializer_class = StudentSerializer
#     def get_queryset(self):
#         user = self.request.user
#         return Student.objects.all()
    
#     def perform_create(self, serializer):
#         if serializer.is_valid():
#             serializer.save(user=self.request.user)
#         else:
#             print(serializer.errors)
    
# class StudentDelete(generics.DestroyAPIView):
#     serializer_class = StudentSerializer
#     permission_classes = [IsAuthenticated]
#     def get_queryset(self):
#         user = self.request.user
#         return Student.objects.filter(user=user)
    

# class CreateUserView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [AllowAny]