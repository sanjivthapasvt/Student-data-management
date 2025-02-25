#!/usr/bin/env python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import pandas as pd
import sys

@csrf_exempt
def excel_parser(request):
    if request.method == 'POST':
        try:
            if 'excelFile' not in request.FILES:
                return JsonResponse({'error': 'No file uploaded'}, status=400)
            
            file = request.FILES['excelFile']
            if not file.name:
                return JsonResponse({'error': 'Empty file uploaded'}, status=400)
            
            df = pd.read_excel(file)
            # Debug output
            print("File name:", file.name, file=sys.stderr)
            print("Columns:", df.columns.tolist(), file=sys.stderr)
            print("First 5 rows:", df.head(5).to_dict(orient='records'), file=sys.stderr)
            
            columns = df.columns.tolist()
            rows = df.head(5).to_dict(orient='records')
            stats = {
                'total_rows': len(df),
                'total_columns': len(columns)
            }
            return JsonResponse({
                'columns': columns,
                'rows': rows,
                'stats': stats
            })
        except Exception as e:
            print(f"Error processing file: {str(e)}", file=sys.stderr)
            return JsonResponse({'error': 'Internal server error'}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)