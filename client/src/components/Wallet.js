import React, { useState, useEffect } from 'react';

const Wallet = () => {
  const [address, setAddress] = useState();
  const [balance, setBalance] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:3000/api/v1/wallet');
      const data = await response.json();
      
      setAddress(data.address);
      setBalance(data.balance);
    }

    fetchData()
      .catch(console.error);
  }, []);

  return(
    <div>
      <dl>
        <dt>Address:</dt>
        <dd>{address}</dd>
        <dt>Balance:</dt>
        <dd>{balance}</dd>
      </dl>
    </div>
  );
}

export default Wallet;
