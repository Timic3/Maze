precision mediump float;
uniform float u_time;
#define iterations 10
#define formuparam2 0.5
#define volsteps 8
#define stepsize 0.290
#define zoom 0.900
#define tile 0.950
#define speed2 0.01
#define brightness 0.003
#define darkmatter 0.400
#define distfading 0.560
#define saturation 0.800
#define transverseSpeed zoom*.2
#define cloud 0.11
float n(float v,float s){float e=2.*abs(2.*(v/s-floor(v/s+.5)))-1.;return e;}float n(in vec3 f){float s=7.+.03*log(1e-06+fract(sin(u_time)*4373.11)),c=0.,e=0.,r=0.;for(int t=0;t<6;++t){float m=dot(f,f);f=abs(f)/m+vec3(-.5,-.8+.1*sin(u_time*.7+2.),-1.1+.3*cos(u_time*.3));float b=exp(-float(t)/7.);c+=b*exp(-s*pow(abs(m-e),2.3));r+=b;e=m;}return max(0.,5.*c/r-.7);}void main(){vec2 b=2.*gl_FragCoord.rg/vec2(512)-1.,s=b*vec2(512)/512.;float t=u_time,f=speed2;f=-.004*cos(t*.02+.785398);float e=formuparam2;vec2 c=s;float i=.9,r=-.6,m=.9+u_time*.04;mat2 a=mat2(cos(i),sin(i),-sin(i),cos(i)),d=mat2(cos(r),sin(r),-sin(r),cos(r)),l=mat2(cos(m),sin(m),-sin(m),cos(m));float g=1.;vec3 z=vec3(c*zoom,1.),p=vec3(0.,0.,0.),u=vec3(0.,0.,1.);p.r+=transverseSpeed*6.*cos(.3*u_time)+.01*u_time;p.g+=transverseSpeed*6.*sin(.2*u_time)+.01*u_time;z.r-=.4*(transverseSpeed*7.*cos(.3*u_time)+.01*u_time);z.g+=.2*(transverseSpeed*7.*sin(.2*u_time)+.01*u_time);p.b+=.009*u_time;z.rg*=l;u.rg*=l;z.rb*=a;u.rb*=a;z.gb*=d;u.gb*=d;p.rg*=-l;p.rb*=a;p.gb*=d;float o=(t-3311.)*f;p+=u*o;float x=mod(o,stepsize),S=-x;x/=stepsize;float h=.24,F=h+stepsize/2.;vec3 C=vec3(0.);float w=0.;vec3 k=vec3(0.);for(int Z=0;Z<volsteps;Z++){vec3 Y=p+(h+S)*z,X=p+(F+S)*z;Y=abs(vec3(tile)-mod(Y,vec3(tile*2.)));X=abs(vec3(tile)-mod(X,vec3(tile*2.)));w=n(X);float W,V=W=0.;for(int U=0;U<iterations;U++){Y=abs(Y)/dot(Y,Y)-e;float T=abs(length(Y)-W);V+=U>7?min(12.,T):T;W=length(Y);}V*=V*V;float T=h+S,U=pow(distfading,max(0.,float(Z)-x));C+=U;if(Z==0)U*=1.-x;if(Z==volsteps-1)U*=x;C+=vec3(T,T*T,T*T*T*T)*V*brightness*U;k+=mix(0.,g,U)*vec3(1.8*w*w*w,1.4*w*w,w)*U;h+=stepsize;F+=stepsize;}C=mix(vec3(length(C)),C,saturation);vec4 U=vec4(C*.01,1.);k*=cloud;k.b*=1.8;k.r*=.05;k.b=.5*mix(k.g,k.b,.8);k.g=0.;gl_FragColor=U+vec4(k,1.);}