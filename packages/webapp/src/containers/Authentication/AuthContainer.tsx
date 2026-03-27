// @ts-nocheck
import styled from 'styled-components';
interface AuthContainerProps {
  children: React.ReactNode;
}
export function AuthContainer({ children }: AuthContainerProps) {
  return (
    <AuthPage>
      <AuthInsider>
        <AuthLogo>
          <img src="/fasthometax.png" height={80} alt="Fast Home Tax" />
        </AuthLogo>
        {children}
      </AuthInsider>
    </AuthPage>
  );
}
const AuthPage = styled.div``;
const AuthInsider = styled.div`
  width: 384px;
  margin: 0 auto;
  margin-bottom: 40px;
  padding-top: 80px;
`;
const AuthLogo = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;
