import time
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

_cache = {'rate': None, 'fetched_at': 0}
CACHE_TTL = 86400  # 24 hours

FALLBACK_RATE = 2500  # fallback if API fails

FREE_APIS = [
    'https://open.er-api.com/v6/latest/USD',
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
]


def get_usd_to_tsh(force=False):
    now = time.time()
    if not force and _cache['rate'] and (now - _cache['fetched_at']) < CACHE_TTL:
        return _cache['rate']

    import urllib.request
    import json

    for api_url in FREE_APIS:
        try:
            req = urllib.request.Request(api_url, headers={'User-Agent': 'BurgerSupreme/1.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())

            if 'rates' in data:
                rate = data['rates'].get('TZS')
            elif 'usd' in data:
                rate = data['usd'].get('tzs')
            else:
                continue

            if rate and rate > 0:
                _cache['rate'] = float(rate)
                _cache['fetched_at'] = now
                logger.info(f'USD→TSH rate updated: {rate}')
                return float(rate)
        except Exception as e:
            logger.warning(f'Exchange API failed ({api_url}): {e}')
            continue

    if _cache['rate']:
        return _cache['rate']

    logger.warning(f'All exchange APIs failed, using fallback rate: {FALLBACK_RATE}')
    _cache['rate'] = FALLBACK_RATE
    _cache['fetched_at'] = now
    return FALLBACK_RATE


def usd_to_tsh(usd_amount):
    rate = get_usd_to_tsh()
    return round(usd_amount * rate)
