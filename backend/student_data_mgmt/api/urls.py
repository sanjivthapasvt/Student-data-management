from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import StudentDetail, StudentCreate, StudentsMarks 
from .excel_parser import excel_parser
urlpatterns = [
    path('students/<int:id>/', StudentDetail.as_view(), name='student-detail'),
    path('students/', StudentCreate.as_view(), name='student-create'), 
    path('students/marks/', StudentsMarks.as_view(), name='student-marks'),
    path('students/marks/<int:id>/', StudentsMarks.as_view(), name='student-marks-detail'),
    path('process-excel/', excel_parser, name='excel_parser'),
    
]

# For media file i.e images
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)