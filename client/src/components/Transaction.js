import React from 'react';

const Transaction = (props) => {
  const { input, output } = props;

  return(
    <div className="transaction">
      {
        Object.entries(output)
          .filter(([recipient]) => recipient !== input.address)
          .map(([recipient, amount]) => {
            return(
              <dl key={recipient} className="row">
                <dt className="col-lg-2 col-md-3">Sender</dt>
                <dd className="col-lg-9 col-md-8">{input.address}</dd>
                <dt className="col-lg-2 col-md-3">Recipient</dt>
                <dd className="col-lg-9 col-md-8">{recipient}</dd>
                <dt className="col-lg-2 col-md-3">Amount</dt>
                <dd className="col-lg-9 col-md-8">{amount}</dd>
              </dl>
            );
          })
      }
    </div>
  );
}

export default Transaction;
