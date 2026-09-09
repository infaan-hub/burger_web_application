from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        data = response.data

        if isinstance(data, dict):
            code = data.get('code', '')
            messages = data.get('messages', [])
            detail = data.get('detail', '')

            if code == 'token_not_valid' or 'token' in str(detail).lower() and 'expired' in str(detail).lower():
                response.data = {'error': 'Session expired. Please login again'}
                response.status_code = status.HTTP_401_UNAUTHORIZED
                return response

            if code == 'token_not_valid':
                response.data = {'error': 'Invalid session. Please login again'}
                response.status_code = status.HTTP_401_UNAUTHORIZED
                return response

            if 'authorization' in str(detail).lower() or 'credentials' in str(detail).lower():
                response.data = {'error': 'Authentication required. Please login'}
                response.status_code = status.HTTP_401_UNAUTHORIZED
                return response

            if isinstance(detail, str):
                friendly = _friendly_message(detail, response.status_code)
                if friendly:
                    response.data = {'error': friendly}
                    return response

        if isinstance(data, list):
            for i, item in enumerate(data):
                if isinstance(item, dict) and 'message' in item:
                    msg = item['message']
                    friendly = _friendly_message(msg, response.status_code)
                    if friendly:
                        data[i] = {'message': friendly}
            response.data = data
            return response

    return response


def _friendly_message(msg, status_code):
    msg_lower = msg.lower()

    if 'expired' in msg_lower and 'token' in msg_lower:
        return 'Session expired. Please login again'

    if 'invalid' in msg_lower and 'token' in msg_lower:
        return 'Invalid session. Please login again'

    if 'no such user' in msg_lower or 'user not found' in msg_lower:
        return 'Invalid username or password'

    if 'password' in msg_lower and ('incorrect' in msg_lower or 'wrong' in msg_lower):
        return 'Invalid username or password'

    if 'already exists' in msg_lower:
        return 'This username is already taken'

    if 'required' in msg_lower and 'field' in msg_lower:
        return 'Please fill in all required fields'

    if 'invalid' in msg_lower and 'email' in msg_lower:
        return 'Please enter a valid email address'

    return None
