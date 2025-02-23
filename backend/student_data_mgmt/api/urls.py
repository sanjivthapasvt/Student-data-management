from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import StudentDetail, StudentCreate, StudentMarksAll, StudentsMarks 

urlpatterns = [
    path('students/<int:id>/', StudentDetail.as_view(), name='student-detail'),
    path('students/', StudentCreate.as_view(), name='student-create'), 
    path('students/marks/', StudentMarksAll.as_view(), name='student-marks-all'),
    path('students/marks/<int:id>/', StudentsMarks.as_view(), name='student-marks-detail'),
]

# For media file i.e images
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)