const getHTML = async () => {
  return await fetch("/");
};

const decodeHTML = async () => {
  const response = await getHTML();
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("charset=UTF-8")) {
    const buffer = await response.arrayBuffer(); // 바이트 데이터로 읽기
    const decoder = new TextDecoder("utf-8");
    const htmlString = decoder.decode(buffer); // 문자열로 변환

    console.log(htmlString);
  } else {
    console.error("Unsupported Content-Type or charset missing");
  }
};

decodeHTML();
