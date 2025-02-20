from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    # URl for student maangement
    path('students/', views.StudentCreate.as_view(), name='student-create'), 
    path('students/<int:id>/', views.StudentDetail.as_view(), name='student-detail'),
]
# For media file i.e images
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)