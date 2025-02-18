from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from . import views


urlpatterns = [
    path('students/', views.StudentListCreate.as_view(), name='student-view-create'),
    path('students/<int:id>/', views.StudentRetrieveUpdateDestroy.as_view(), name='student-view-retrieve-update-destroy'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)