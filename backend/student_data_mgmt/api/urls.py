from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views


urlpatterns = [
    # path('students/', views.StudentListCreate.as_view(), name='student-view-create'),
    # path('students/delete/<int:id>/', views.StudentDelete.as_view(), name='delete-student'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)