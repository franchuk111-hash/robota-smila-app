import urllib.request,urllib.parse,http.cookiejar,json,time,hmac,hashlib,pathlib
base='http://127.0.0.1:3140'
jar=http.cookiejar.CookieJar(); client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
def req(path,data=None):
 body=urllib.parse.urlencode(data).encode() if data is not None else None
 r=client.open(urllib.request.Request(base+path,data=body,headers={'X-Auth-Return-Redirect':'1'}),timeout=20)
 return r,json.load(r)
r,options=req('/api/auth-options');assert options.get('google') is False and options.get('telegramUsername') in ('Fixture_bot', None) # OpenNext may normalize request origin to the production host; an unregistered fixture bot then fails readiness closed.
assert 'no-store' in r.headers['Cache-Control']
_,providers=req('/api/auth/providers');assert list(providers)==['telegram']
_,empty=req('/api/auth/session');assert empty is None
_,csrf=req('/api/auth/csrf')
payload={'id':10001,'first_name':'Local fixture','auth_date':int(time.time())}
check='\n'.join(f'{k}={payload[k]}' for k in sorted(payload))
secret=hashlib.sha256(b'local-release-fixture-token').digest()
payload['hash']=hmac.new(secret,check.encode(),hashlib.sha256).hexdigest()
_,signed=req('/api/auth/callback/telegram',{'csrfToken':csrf['csrfToken'],'payload':json.dumps(payload),'callbackUrl':base+'/profil'})
_,session=req('/api/auth/session');assert session['user']['name']=='Local fixture',session
assert any(c.name.endswith('session-token') for c in jar)
_,csrf=req('/api/auth/csrf');req('/api/auth/signout',{'csrfToken':csrf['csrfToken'],'callbackUrl':base+'/'})
_,session=req('/api/auth/session');assert session is None,session
_,csrf=req('/api/auth/csrf');payload['first_name']='tampered'
try:req('/api/auth/callback/telegram',{'csrfToken':csrf['csrfToken'],'payload':json.dumps(payload),'callbackUrl':base+'/profil'})
except urllib.error.HTTPError as e:assert e.code in (400,401)
_,session=req('/api/auth/session');assert session is None
result={'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'base':base,'checks':['runtime providers','public config no-store','anonymous session','signed fixture login','JWT session cookie','logout','tampered payload rejected'],'realUserLogin':False,'failures':[]}
pathlib.Path('reports/auth-workerd-smoke.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
