//simulate getting products from DataBase
const products = [
  { name: "Apples", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];

// region Networking
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    const didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);

  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

// region products
const App = (props) => {
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;

  const { Fragment, useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  
  const [items, setItems] = React.useState(products);

  const addToCart = (e) => {
    const name = e.target.name;
    const item = items.filter((item) => item.name == name);
    setCart([...cart, ...item]);
  };

  const deleteCartItem = (index) => {
    const newCart = cart.filter((item, i) => index != i);
    setCart(newCart);
  };

  const list = items.map((item, index) => {
    const n = index + 15;
    const url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        <Image src={url} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name} : {`$${item.cost}`}
        </Button>
        <input name={item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });

  const cartList = cart.map((item, index) => {
    return (
      <Accordion key={index} defaultActiveKey="0">
        <Accordion.Item eventKey={index}>
          <Accordion.Header>
            {item.name}
          </Accordion.Header>
          <Accordion.Body onClick={() => deleteCartItem(index)}>
            $ {item.cost} from {item.country}
          </Accordion.Body>
        </Accordion.Item>
    </Accordion>
    );
  });

  const finalList = () => {
    const total = checkOut();
    const final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    const costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    const newTotal = costs.reduce(reducer, 0);
    return newTotal;
  };

  const restockProducts = (url) => {
    doFetch(url);

    const newItems = data.map(item => {
      const { name, country, cost, instock } = item.attributes;
      return { name, country, cost, instock };
    })
    
    setItems([...items, ...newItems]);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Products</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart</h1>
          <Accordion defaultActiveKey="0">{cartList}</Accordion>
        </Col>
        <Col>
          <h1>Check Out</h1>
          <Button onClick={checkOut}>Check Out ${finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(url);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            onChange={(event) => setUrl(event.target.value)}
          />
          <button type="submit">Restock Products</button>
        </form>
      </Row>
    </Container>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
