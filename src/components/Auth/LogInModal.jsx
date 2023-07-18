import { createPortal } from 'react-dom';
import { styled } from 'styled-components';
import '../../color.css';
import useInput from '../../hooks/useInput';
import Button from '../Button';
import { browserSessionPersistence, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useDispatch } from 'react-redux';
import { getUser } from '../../redux/modules/userSlice';

export const PORTAL_MODAL = 'portal-root';

const LogInModal = ({ isOpen, setIsOpen }) => {
  const [email, emailChangeHandler] = useInput('');
  const [password, passwordChangeHandler] = useInput('');

  const dispatch = useDispatch();

  const logIn = async (e) => {
    e.preventDefault();
    try {
      setPersistence(auth, browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      dispatch(
        getUser({
          userId: userCredential.user.uid,
          displayName: userCredential.user.displayName,
          email: userCredential.user.email
        })
      );
      alert('로그인되었습니다.');
      setIsOpen(false);
    } catch (error) {
      console.log('error', error);
      switch (error.code) {
        case 'auth/invalid-email':
          return alert('올바른 이메일 형식을 입력하세요.');
        case 'auth/wrong-password':
          return alert('비밀번호가 틀렸습니다.');
        case 'auth/user-not-found':
          return alert('존재하지 않는 이메일입니다.');
        case 'auth/missing-password':
          return alert('비밀번호를 입력해주세요.');
        default:
          return;
      }
    }
  };

  const closeHandler = () => {
    setIsOpen(false);
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return isOpen
    ? createPortal(
        <Outer onClick={closeHandler}>
          <Inner onClick={stopPropagation} onSubmit={logIn}>
            <p>로그인이 필요해요 :)</p>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={emailChangeHandler}
              placeholder="이메일"
              autoFocus
            />
            <Input
              type="password"
              name="password"
              value={password}
              onChange={passwordChangeHandler}
              placeholder="비밀번호"
            />
            <StButtonSet>
              <Button type="submit" color="navy" size="small">
                로그인
              </Button>
              <Button color="navy" size="small" onClick={closeHandler}>
                닫기
              </Button>
            </StButtonSet>
          </Inner>
        </Outer>,
        document.getElementById(PORTAL_MODAL)
      )
    : null;
};

export default LogInModal;

const Outer = styled.div`
  position: fixed;
  top: 0;
  left: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  z-index: 100;
`;

const Inner = styled.form`
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: center;
  padding: 100px;
  background-color: var(--color_pink2);
  border-radius: 10px;

  p {
    font-size: larger;
    margin-bottom: 10px;
  }
`;

const Input = styled.input`
  width: 15rem;
  margin-top: 10px;
  padding: 5px;
  background-color: var(--color_pink3);
  border: 1px solid var(--color_pink1);
  border-radius: 5px;
  outline: none;
  &:focus {
    border: 2px solid var(--color_pink1);
  }
`;

const StButtonSet = styled.div`
  display: flex;
  margin-top: 20px;
  gap: 5px;
`;
