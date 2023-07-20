import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Map, MapInfoWindow, MapMarker, ZoomControl, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { useQuery } from 'react-query';
import { getStores } from '../api/stores';
import { useDispatch, useSelector } from 'react-redux';
import { markerAddress } from '../redux/modules/mapSlice';
import MarkerGray from '../images/footprint_marker_navy.svg';
import MarkerRed from '../images/footprint_marker_red.svg';
import KakaoCustomInto from './map/KakaoCustomInto';
import Button from './Button';
import { toggleMap } from '../redux/modules/toggleSlice';
import { styled } from 'styled-components';

function KakaoMap() {
  const { kakao } = window;
  const { isLoading, isError, data } = useQuery('stores', getStores);
  const mapRef = useRef(null);
  const [clickAddress, setClickAddress] = useState([]);

  // 이건 나중에 사용해서 맵 중앙을 바꿀 수 있는 useState 훅입니다.
  const [latitude, setLatitude] = useState(37.5543737621718);
  const [longitude, setLongitude] = useState(126.83326640676);
  const [positionList, setPositionList] = useState([]);
  const [position, setPosition] = useState('');

  // 커스텀 인포박스 토글부분입니다.
  const toggleSelector = useSelector((state) => state.toggleSlice);
  const dispatch = useDispatch();
  const { lat, lng } = position;
  const [toggleCustom, setToggleCustom] = useState(toggleSelector);

  const [test, setTest] = useState('');

  useEffect(() => {
    // 주소 => 위도, 경도로 변환하는 함수입니다.
    const geocoder = new window.kakao.maps.services.Geocoder();
    const geocodeAddress = () => {
      data &&
        data.map((el) => {
          return geocoder.addressSearch(el.location, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const { x, y } = result[0];
              setPositionList((prev) => [...prev, { lat: +y, lng: +x }]);
            }
          });
        });
    };
    geocodeAddress();
  }, [data]);

  // 검색시 주소를 얻습니다.
  useEffect(() => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    const geocodeAddress = () => {
      return geocoder.addressSearch(test, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const { x, y } = result[0];
        }
      });
    };
    geocodeAddress();
    // 주소 => 위도, 경도로 변환하는 함수입니다.
  }, [test]);

  // 지도 클릭시 주소, 정보를 출력합니다
  const getCoor2Address = useCallback(
    (lat, lng) => {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2Address(lng, lat, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          setClickAddress(result[0].address);
        }
      });
    },
    [lat, lng]
  );
  // 받아온 데이터 주소 => 위도, 경도로 변환후 newData로 저장
  const newData =
    positionList.length > 0 &&
    data.map((el, index) => {
      return {
        ...el,
        latlng: positionList[index]
      };
    });

  if (isLoading) return '123';
  if (isError) return '123';
  return (
    <>
      {
        <Map
          ref={mapRef}
          center={{ lat: latitude, lng: longitude }}
          style={{ width: '100%', height: '60vh', padding: '20px' }}
          level={8} // 지도의 확대 레벨
          onClick={(e, event) => {
            setPosition({
              lat: event.latLng.getLat(),
              lng: event.latLng.getLng()
            });
            dispatch(markerAddress({ lat, lng }));
            getCoor2Address(event.latLng.getLat(), event.latLng.getLng());
          }}
        >
          <ZoomControl position={window.kakao.maps.ControlPosition.TOPRIGHT} />
          {position && (
            <MapMarker
              position={position}
              image={{
                src: MarkerGray,
                size: {
                  width: 64,
                  height: 69
                },
                options: {
                  offset: {
                    x: 27,
                    y: 69
                  }
                }
              }}
            >
              <StClickInfoWindow
                style={{
                  padding: '7px ',
                  color: 'rgb(0, 0, 0)',
                  width: '162px',
                  textAlign: 'center',
                  lineHeight: '20px'
                }}
              >
                이 store을
                <br /> 추가해보세요 <br />
                <StClickInfoWindowSpan>{clickAddress.address_name}</StClickInfoWindowSpan>
                <Button color="pink2" size="small">
                  ADD
                </Button>
              </StClickInfoWindow>
            </MapMarker>
          )}

          {/* 마우스 클릭 마커  */}
          {positionList.length >= newData.length &&
            newData.map((data, index) => {
              const { id, latlng } = data;
              return (
                <>
                  <MapMarker
                    onClick={() => {
                      dispatch(toggleMap({ state: true, index: index }));
                      setToggleCustom({ state: true, index: index });
                    }}
                    key={id + index}
                    position={latlng}
                    image={{
                      src: MarkerRed,
                      size: {
                        width: 64,
                        height: 69
                      },
                      options: {
                        offset: {
                          x: 32,
                          y: 35
                        }
                      }
                    }}
                  ></MapMarker>
                  {console.log(toggleCustom.state === true && toggleCustom.index === index)}
                  {toggleCustom.state === true && toggleCustom.index === index ? (
                    <CustomOverlayMap
                      xAnchor={0.5}
                      yAnchor={1.5}
                      clickable={true}
                      position={{ lat: latlng.lat, lng: latlng.lng }}
                    >
                      <KakaoCustomInto clickable={true} data={data} index={index} />
                    </CustomOverlayMap>
                  ) : null}
                </>
              );
            })}
        </Map>
      }
      <input
        onChange={(e) => setTest(e.target.value)}
        style={{ display: 'inline-block', marginLeft: '500px' }}
        type="text"
        value={test}
      />
    </>
  );
}

export default React.memo(KakaoMap);

const StClickInfoWindow = styled.div`
  position: relative;
`;
const StClickInfoWindowSpan = styled.span`
  font-size: 11px;
  opacity: 0.8;
`;