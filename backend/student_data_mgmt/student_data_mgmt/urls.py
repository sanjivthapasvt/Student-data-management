from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # path('admin/', admin.site.urls),
    # path('api/user/register/', CreateUserView.as_view(), name='register'),
    # path('api/token/', TokenObtainPairView.as_view(), name='get-token'),
    # path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh-token'),
    # path('api-auth/', include('rest_framework.urls')),
    path('api/', include('api.urls')),
]